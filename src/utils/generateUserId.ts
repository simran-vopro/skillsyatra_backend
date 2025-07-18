import { User, IUser } from "../models/User";

type UserType = "admin" | "user" | "agent" | "guest";

const generateUserId = async (type: UserType): Promise<string> => {
  const prefixMap: Record<UserType, string> = {
    admin: "ADM",
    user: "U",
    agent: "AGT",
    guest: "GST",
  };

  const prefix = prefixMap[type];
  if (!prefix) throw new Error("Invalid user type");

  const lastUser = await User.find<IUser>({ type })
    .sort({ createdAt: -1 })
    .limit(1);

  let lastNumber = 0;
  if (lastUser.length && lastUser[0].userId) {
    const lastId = lastUser[0].userId;
    lastNumber = parseInt(lastId.replace(prefix, "")) || 0;
  }

  const newId = `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
  return newId;
};

export default generateUserId;
