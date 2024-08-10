import { useRecoilState } from "recoil";
import { userAtom } from "../atoms/user";
import React, { useEffect, useRef, useState } from "react";
import { User } from "../utils/types";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AppBar = () => {
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const closeOpenDropdown = (e: MouseEvent) => {
      if (visible && !dropdownRef.current?.contains(e.target as Node)) {
        setVisible(false);
        e.stopPropagation();
      }
    };
    document.addEventListener("mousedown", closeOpenDropdown);
    return () => {
      document.removeEventListener("mousedown", closeOpenDropdown);
    };
  }, [visible]);
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
        <a
          onClick={() => {
            navigate("/rooms");
          }}
          className="transition hover:text-primary-600 cursor-pointer "
        >
          <p>Compete</p>
        </a>
      </div>
      <div className="flex items-center">
        {!user ? (
          <button
            type="button"
            onClick={() => {
              navigate("/signin");
            }}
            className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
          >
            Sign in
          </button>
        ) : (
          <UserMenu
            user={user}
            setUser={setUser}
            visible={visible}
            setVisible={setVisible}
            dropdownRef={dropdownRef}
          />
        )}
      </div>
    </div>
  );
};

const UserMenu = ({
  user,
  setUser,
  visible,
  setVisible,
  dropdownRef,
}: {
  user: User;
  setUser: (user: User | null) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}) => {
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        className="flex text-sm bg-blue-600 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
        id="user-menu-button"
        onClick={() => setVisible(!visible)}
        aria-expanded="false"
        data-dropdown-toggle="user-dropdown"
        data-dropdown-placement="bottom"
      >
        <span className="sr-only">Open user menu</span>
        <div className="w-9 h-9 rounded-full cursor-pointer bg-primary-600 text-center flex justify-center items-center font-bold text-white text-lg">
          {user.name?.charAt(0).toUpperCase() || user.email[0].toUpperCase()}
        </div>
      </button>
      {visible && (
        <div
          ref={dropdownRef}
          className="z-50 my-4 text-base list-none divide-y rounded-b-lg shadow bg-gray-800 divide-gray-600 absolute top-8 right-8"
        >
          <div className="px-4 py-3">
            <span className="block text-sm text-white">
              {user.name || "Anonymous"}
            </span>
            <span className="block text-sm  truncate text-gray-400">
              {user.email}
            </span>
          </div>
          <ul className="py-2" aria-labelledby="user-menu-button">
            <li className="cursor-pointer">
              <a
                href="#"
                className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
              >
                Dashboard
              </a>
            </li>
            <li className="cursor-pointer">
              <a
                href="#"
                className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
              >
                Settings
              </a>
            </li>

            <li className="cursor-pointer">
              <a
                onClick={async () => {
                  const res = await axios.post(
                    user.role === "ADMIN"
                      ? "http://localhost:8080/api/v1/admin/logout"
                      : "http://localhost:8080/api/v1/user/logout"
                  );
                  if (res.data.message === "Logged out") {
                    setUser(null);
                    setVisible(false);
                    navigate("/");
                  } else {
                    alert("Something went wrong");
                  }
                }}
                className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
              >
                Sign out
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
