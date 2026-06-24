import { useContext } from "react";
import { StatusBoardContext } from "../context/StatusBoardContext";

const useStatusBoard = () => {
    const ctx = useContext(StatusBoardContext);
    if (!ctx) throw new Error("useStatusBoard must be used within StatusBoardProvider");
    return ctx;
};

export default useStatusBoard;