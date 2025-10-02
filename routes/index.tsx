import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import NotesManager from "../islands/NotesManager.tsx";

export default define.page(function Home(ctx) {
  console.log("Shared value " + ctx.state.shared);

  return (
    <div class="px-4 py-8 mx-auto bg-base-100 min-h-screen">
      <Head>
        <title>노트 관리 앱</title>
      </Head>
      <div class="max-w-screen-lg mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2">📝 노트 관리 시스템</h1>
          <p class="text-base-content/70">
            Deno KV를 사용한 실시간 노트 저장 및 관리
          </p>
        </div>

        <NotesManager />
      </div>
    </div>
  );
});
