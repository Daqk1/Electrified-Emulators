import { Editor } from './editor/Editor';
import { EditorProvider } from './state/EditorProvider';

export function App() {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
}
