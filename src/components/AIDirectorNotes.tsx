"use client";

const AIDirectorNotes = () => {
  return (
    <div className="relative w-full h-[95px] bg-black/30 rounded-[10px] p-4 border border-white/20 focus-within:border-[#7C4DFF] transition-all">
      <textarea
        placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
        className="w-full h-full bg-transparent resize-none font-roboto font-normal text-base leading-[19px] text-white placeholder:text-[#C2C6D6]/40 focus:outline-none"
      />
    </div>
  );
};

export default AIDirectorNotes;
