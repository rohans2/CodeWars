export const Popup = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex justify-center items-center z-[9999] text-white font-medium text-lg backdrop-blur">
      {children}
    </div>
  );
};
