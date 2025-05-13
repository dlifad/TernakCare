import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const Alert = ({ type, message, className }) => (
    <div
        className={`
      flex items-center p-4 rounded-md
      ${type === "success" ? "bg-[#ECF8F3] text-[#088054]" : ""}
      ${type === "error" ? "bg-[#FEF3F2] text-[#B42318]" : ""}
      ${className}
    `}
    >
        {type === "success" && (
            <CheckCircle className="w-5 h-5 mr-3 text-[#088054]" />
        )}
        {type === "error" && (
            <XCircle className="w-5 h-5 mr-3 text-[#B42318]" />
        )}
        <span className="text-sm font-medium">{message}</span>
    </div>
);

export default Alert;
