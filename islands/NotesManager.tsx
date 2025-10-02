import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface Note {
  id: string;
  value: {
    title: string;
    content: string;
    createdAt: number;
  };
}

export default function NotesManager() {
  const title = useSignal("");
  const content = useSignal("");
  const notes = useSignal<Note[]>([]);
  const loading = useSignal(false);
  const message = useSignal("");

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    loading.value = true;
    message.value = "";
    try {
      const response = await fetch("/api/notes");
      const result = await response.json();

      if (result.success) {
        notes.value = result.data;
        message.value = `✓ ${result.count}개의 노트를 불러왔습니다`;
      } else {
        message.value = `✗ 오류: ${result.error}`;
      }
    } catch (error) {
      message.value = `✗ 네트워크 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;
    } finally {
      loading.value = false;
    }
  };

  const saveNote = async () => {
    if (!title.value.trim() || !content.value.trim()) {
      message.value = "✗ 제목과 내용을 모두 입력해주세요";
      return;
    }

    loading.value = true;
    message.value = "";
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.value,
          content: content.value,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.value = "✓ 노트가 저장되었습니다";
        title.value = "";
        content.value = "";
        await loadNotes(); // Reload notes after saving
      } else {
        message.value = `✗ 오류: ${result.error}`;
      }
    } catch (error) {
      message.value = `✗ 네트워크 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;
    } finally {
      loading.value = false;
    }
  };

  const deleteNote = async (id: string) => {
    loading.value = true;
    message.value = "";
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        message.value = "✓ 노트가 삭제되었습니다";
        await loadNotes();
      } else {
        message.value = `✗ 오류: ${result.error}`;
      }
    } catch (error) {
      message.value = `✗ 네트워크 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;
    } finally {
      loading.value = false;
    }
  };

  return (
    <div class="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Input Form */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">새 노트 작성</h2>

          <div class="form-control">
            <label class="label">
              <span class="label-text">제목</span>
            </label>
            <input
              type="text"
              placeholder="노트 제목을 입력하세요"
              class="input input-bordered w-full"
              value={title.value}
              onInput={(e) => title.value = (e.target as HTMLInputElement).value}
              disabled={loading.value}
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">내용</span>
            </label>
            <textarea
              placeholder="노트 내용을 입력하세요"
              class="textarea textarea-bordered h-24"
              value={content.value}
              onInput={(e) => content.value = (e.target as HTMLTextAreaElement).value}
              disabled={loading.value}
            />
          </div>

          <div class="card-actions justify-end gap-2 mt-4">
            <button
              class="btn btn-primary"
              onClick={saveNote}
              disabled={loading.value}
            >
              {loading.value ? (
                <span class="loading loading-spinner loading-sm"></span>
              ) : (
                "💾 저장"
              )}
            </button>
            <button
              class="btn btn-secondary"
              onClick={loadNotes}
              disabled={loading.value}
            >
              {loading.value ? (
                <span class="loading loading-spinner loading-sm"></span>
              ) : (
                "🔄 새로고침"
              )}
            </button>
          </div>

          {/* Status Message */}
          {message.value && (
            <div class={`alert ${message.value.startsWith("✓") ? "alert-success" : "alert-error"} mt-4`}>
              <span>{message.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">저장된 노트 ({notes.value.length})</h2>

          {notes.value.length === 0 ? (
            <p class="text-center text-base-content/60 py-8">
              저장된 노트가 없습니다
            </p>
          ) : (
            <div class="space-y-4">
              {notes.value.map((note) => (
                <div key={note.id} class="card bg-base-100 shadow">
                  <div class="card-body p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h3 class="font-bold text-lg">{note.value.title}</h3>
                        <p class="text-sm text-base-content/70 mt-1">
                          {note.value.content}
                        </p>
                        <p class="text-xs text-base-content/50 mt-2">
                          {new Date(note.value.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <button
                        class="btn btn-ghost btn-sm btn-square text-error"
                        onClick={() => deleteNote(note.id)}
                        disabled={loading.value}
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
