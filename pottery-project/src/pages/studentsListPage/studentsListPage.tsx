import React from "react";

export const StudentsListPage: React.FC<{ studentsFromProps?: any[] }> = ({ studentsFromProps }) => {
  const studentsOnPage = studentsFromProps?.slice(0, 10) || [];

  return (
    <div>
      {studentsOnPage.map((s: any) => (
        <div key={s.id}>{s.fullName}</div>
      ))}
      {studentsFromProps && studentsFromProps.length > 10 && (
        <button>2</button>
      )}
    </div>
  );
};