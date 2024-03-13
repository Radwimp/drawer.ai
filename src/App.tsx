import { Layer, Line, Stage } from 'react-konva';
import useLineDrawer from './hooks/useLineDrawer';
import { Size } from './enums';

export default function App() {
  const { lines, changeSize, ...props } = useLineDrawer();

  return (
    <main className="p-10 m-auto">
      <div className="flex justify-around w-1/2 m-auto">
        {Object.keys(Size).map((size) => (
          <button
            key={size}
            onClick={() => changeSize(Size[size as keyof typeof Size])}
            className="px-5 py-1 text-orange-500 border-2 border-violet-600 rounded-xl capitalize"
          >
            {size}
          </button>
        ))}
      </div>
      <Stage {...props} className="mx-auto my-8 w-fit border-2 border-red-800">
        <Layer>
          {lines.map((line, i) => (
            <Line key={i} points={line} stroke="#4b2ede" strokeWidth={3} />
          ))}
        </Layer>
      </Stage>
      <div className="w-1/2 min-h-36 m-auto px-8 py-4 bg-gray-200">
        {lines.map((line, i) => (
          <div key={i}>
            Line {i + 1} — points [{line.join(', ')}]
          </div>
        ))}
      </div>
    </main>
  );
}
