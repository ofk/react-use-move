import { UseMoveExamples } from './UseMoveExamples';
import { UseMovePointStateExamples } from './UseMovePointStateExamples';

export function App(): React.ReactElement {
  return (
    <div>
      <h1>react-use-move examples</h1>
      <h2>useMovePointState</h2>
      <UseMovePointStateExamples />
      <h2>useMove</h2>
      <UseMoveExamples />
    </div>
  );
}
