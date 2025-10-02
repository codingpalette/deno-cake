import { define } from "../../../utils.ts";
import { createRecord, listRecords } from "../../../kvHelpers.ts";

interface Note {
  title: string;
  content: string;
  createdAt?: number;
}

export const handler = define.handlers({
  // GET /api/notes - List all notes
  async GET(_ctx) {
    try {
      const notes = await listRecords<Note>("notes", { reverse: true });

      return Response.json({
        success: true,
        data: notes,
        count: notes.length,
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  },

  // POST /api/notes - Create a new note
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { title, content } = body;

      if (!title || !content) {
        return Response.json({
          success: false,
          error: "Title and content are required",
        }, { status: 400 });
      }

      const note = await createRecord<Note>("notes", { title, content });

      return Response.json({
        success: true,
        data: note,
      }, { status: 201 });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  },
});
