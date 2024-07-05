export const LanguageSelector = () => {
  return (
    <form className="w-full sm:w-1/2 lg:w-1/3 ">
      <label
        htmlFor="languages"
        className="block mb-2 text-sm font-medium text-gray-800"
      >
        Select a language
      </label>
      <select
        id="languages"
        className="drop-shadow-md border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
      >
        <option selected value="java">
          Java
        </option>
        <option value="cpp">C++</option>
        <option value="python">Python</option>
        <option value="js">JavaScript</option>
      </select>
    </form>
  );
};
