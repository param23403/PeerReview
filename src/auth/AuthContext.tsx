import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getDoc, doc, getFirestore } from "firebase/firestore";

interface UserData {
  displayName?: string;
  email?: string;
  role?: string;
  [key: string]: any; // Allow other fields
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.error("User data not found in Firestore");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
