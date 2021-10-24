import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

interface AccessTokenResponse {
  access_token: string;
}

interface UserResponse {
  id: number;
  avatar_url: string;
  login: string;
  name: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";
    const { data: AccessTokenResponse } = await axios.post<AccessTokenResponse>(
      url,
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    const response = await axios.get<UserResponse>(
      "https://api.github.com/user",
      {
        headers: {
          authorization: `Bearer ${AccessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, avatar_url, name } = response.data;

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

    const token = sign(
      {
        user: {
          id: user.id,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "3d",
      }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
