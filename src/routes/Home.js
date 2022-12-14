import { useEffect, useState } from "react";
import { dbService } from "fbase";
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import Nweet from "./Nweet";

const Home = ({ userObj }) => {
    const [nweet, setNweet] = useState("");
    const [nweets, setNweets] = useState([]);
    useEffect(() => {
        setNweets([]);
        const unsubscribe = onSnapshot(collection(dbService, "nweets"), (snapshot) =>{
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
        });
    }, []);
    const onSubmit = async (event) => {
        event.preventDefault();
        await addDoc(collection(dbService, "nweets"), {
            text: nweet,
            createdAt: Date.now(),
            creatorId: userObj.uid,
        });
        setNweet("");
    };
    const onChange = (event) => {
        const {
            target: { value },
        } = event;
        setNweet(value);
    };
    return (
        <div>
            <form onSubmit={onSubmit}>
                <input
                    value={nweet}
                    onChange={onChange}
                    type="text"
                    placeholder="What's on your mind?"
                    maxLength={120}
                />
                <input type="submit" value="Nweet" />
            </form>
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