import { WRITING_GUIDE } from "../constants/boardWrite";

export default function WritingGuide() {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-medium text-blue-900 mb-2">{WRITING_GUIDE.title}</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        {WRITING_GUIDE.tips.map((rule, index) => (
          <li key={index}>• {rule}</li>
        ))}
      </ul>
    </div>
  );
}
