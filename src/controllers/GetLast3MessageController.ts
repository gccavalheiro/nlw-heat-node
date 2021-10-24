import { Request, Response } from "express";
import { GetLast3MessagesService } from "../services/GetLast3MessageService";

class GetLast3MessagesController {
  async handle(request: Request, response: Response) {
    const service = new GetLast3MessagesService();

    try {
      const result = await service.execute();

      return response.json(result);
    } catch (error) {
      return response.status(400).json({ error: error.message });
    }
  }
}

export { GetLast3MessagesController };
