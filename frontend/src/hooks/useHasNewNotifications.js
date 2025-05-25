// hooks/useHasNewNotifications.js
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const useHasNewNotifications = () => {
  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const hasNew = (data?.incomingReqs?.length || 0) > 0;

  return hasNew;
};

export default useHasNewNotifications;
