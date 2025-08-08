//user status.tsx dont use until that endpoint is available
// 'use client';
// import { useEffect, useState } from "react";
// import { useAPI } from "../../context/useAPI";

// export function useUserStatus(userIds: string[]) {
//   const { post } = useAPI();
//   const [status, setStatus] = useState<{[key: string]: boolean}>({});

//   useEffect(() => {
//     if (userIds.length === 0) return;
//     post("/users/status/", { user_ids: userIds }).then(res => {
//       setStatus(res.data);
//     });
//     const interval = setInterval(() => {
//       post("/users/status/", { user_ids: userIds }).then(res => setStatus(res.data));
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [userIds]);

//   return status;
// }
