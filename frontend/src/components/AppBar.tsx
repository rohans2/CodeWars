export const AppBar = () => {
  return (
    <div className="max-w-screen flex flex-wrap items-center justify-between px-4 py-3 mx-auto bg-gray-800">
      <a className="cursor-pointer" href="/">
        <img src="/logo.svg" className="h-8 w-28" alt="Logo" />
      </a>
      <div className="flex items-center lg:gap-x-8 gap-x-5 text-white ">
        <a className="transition hover:text-primary-600 cursor-pointer ">
          <p>Home</p>
        </a>
        <a className="transition hover:text-primary-600 cursor-pointer ">
          <p>Practice</p>
        </a>
        <a className="transition hover:text-primary-600 cursor-pointer ">
          <p>Compete</p>
        </a>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
