import { define } from "../../../utils.ts";
import { deleteRecord, getRecord, updateRecord } from "../../../kvHelpers.ts";

interface Note {
  title: string;
  content: string;
  createdAt?: number;
  updatedAt?: number;
}

export const handler = define.handlers({
  // GET /api/notes/:id - Get a single note
  async GET(ctx) {
    try {
      const id = ctx.params.id;
      const note = await getRecord<Note>("notes", id);

      if (!note) {
        return Response.json({
          success: false,
          error: "Note not found",
        }, { status: 404 });
      }

      return Response.json({
        success: true,
        data: { id, value: note },
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  },

  // PATCH /api/notes/:id - Update a note
  async PATCH(ctx) {
    try {
      const id = ctx.params.id;
      const body = await ctx.req.json();
      const { title, content } = body;

      const updated = await updateRecord<Note>("notes", id, {
        ...(title && { title }),
        ...(content && { content }),
      });

      if (!updated) {
        return Response.json({
          success: false,
          error: "Note not found",
        }, { status: 404 });
      }

      return Response.json({
        success: true,
        message: "Note updated successfully",
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  },

  // DELETE /api/notes/:id - Delete a note
  async DELETE(ctx) {
    try {
      const id = ctx.params.id;
      const deleted = await deleteRecord("notes", id);

      if (!deleted) {
        return Response.json({
          success: false,
          error: "Note not found",
        }, { status: 404 });
      }

      return Response.json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  },
});
