import { useState } from "react";

export const ProblemSubmitBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div
      id="accordion-collapse"
      data-accordion="collapse"
      className="fixed bottom-0 right-0 w-full"
    >
      <h2 id="accordion-collapse-heading-1">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center justify-between w-full min-h-13 font-medium rtl:text-right  border border-b-0 border-gray-700    text-gray-400 bg-gray-800 "
          data-accordion-target="#accordion-collapse-body-1"
          aria-expanded="true"
          aria-controls="accordion-collapse-body-1"
        >
          <svg
            data-accordion-icon
            className={`w-3 h-3 shrink-0 ml-5 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
          <div>
            <button
              type="button"
              className="h-full text-black bg-blue-200  hover:bg-blue-100 focus:outline-none    font-medium text-sm px-8 py-4 text-center m-0"
            >
              Run
            </button>
            <button
              type="button"
              className="h-full text-white bg-blue-600  hover:bg-blue-700 focus:outline-none    font-medium text-sm px-8 py-4 text-center m-0"
            >
              Submit
            </button>
          </div>
        </button>
      </h2>

      <div
        id="accordion-collapse-body-1"
        className={isOpen ? "block" : "hidden"}
        aria-labelledby="accordion-collapse-heading-1"
      >
        <div className="p-5 border border-b-0  border-gray-700 bg-gray-900">
          <p className="mb-2  text-gray-400">Random Test Case Info</p>
          <p className=" text-gray-400">
            Decide the UI for this How can I do thisssss
          </p>
        </div>
      </div>
    </div>
  );
};
