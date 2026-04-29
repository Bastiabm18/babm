// components/Spinner.tsx

import NeonSign from "./NeonSign";

const Spinner = () => {
  return (
    <div className="flex flex-col justify-center gap-5 items-center h-screen w-screen bg-background-light dark:bg-background-dark">
      
      <div className="mb-8  flex justify-center items-center">
        <NeonSign/>
      </div>
      <div
      className="w-12 h-12 rounded-full animate-spin
      border-4 border-solid border-background-dark dark:border-background-light border-t-transparent"
      style={{ borderTopColor: 'transparent' }}
    ></div>
    </div>
  );
};

export default Spinner;
