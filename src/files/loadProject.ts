import { parseProject } from '../core/project';
import type { CircuitState } from '../core/types';

export function readProjectFile(file: File): Promise<CircuitState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onabort = () => reject(new Error('Reading the selected file was cancelled.'));
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') throw new Error('Could not read the selected file as text.');
        resolve(parseProject(reader.result));
      } catch (error) { reject(error); }
    };
    reader.readAsText(file);
  });
}
