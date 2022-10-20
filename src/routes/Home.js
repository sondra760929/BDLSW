import { useEffect, useState } from "react";
import { dbService } from "fbase";
import { collection, onSnapshot } from "firebase/firestore";
import Nweet from "./Nweet";
import NweetFactory from "components/NweetFactory";

const Home = ({ userObj }) => {
  const [nweets, setNweets] = useState([]);
  useEffect(() => {
    setNweets([]);
    const unsubscribe = onSnapshot(
      collection(dbService, "nweets"),
      (snapshot) => {
        const db_nweets = [];
        snapshot.forEach((doc) => {
          const nweetObj = {
            id: doc.id,
            ...doc.data(),
          };
          db_nweets.push(nweetObj);
          console.log(nweetObj);
        });
        setNweets(db_nweets);
        console.log(db_nweets);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);
  return (
    <div>
      <NweetFactory userObj={userObj} />
      <div>
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;
