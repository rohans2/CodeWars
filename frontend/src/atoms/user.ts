import { atom, selector } from "recoil";
import { User } from "../utils/types";
import axios from "axios";

export const userAtom = atom<User | null>({
    key:"userState",
    default: selector({
        key: "userSelector",
        get: async () => {
            try{
                const res = await axios.get("http://localhost:8080/api/v1/me", {
                    withCredentials: true,
                });
            if(res.status === 200){
                return res.data;
            }
            return null;
            }catch(e){
                return null;
            }
            
        }
    }),
});
