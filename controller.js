import express from "express";
import bodyParser from "body-parser";
import { async } from "@firebase/util";
import { db, auth } from "./firebase.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, query, collection, doc, onSnapshot, addDoc, deleteDoc, updateDoc, where, increment, getDocs, getDoc } from 'firebase/firestore'

const router = express.Router();

router.use(bodyParser.json());

router.get("/", (req, res) => {
res.send({ response: "Hello World" }).status(200);
});

router.post("/api/register", async(req, res) => {
    let email = req.body.email
    let password = req.body.password
    try{
        await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential => {
            res.send(userCredential)
        }))
    }
    catch(err){
        console.log(err)
    }
})

router.post("/api/link", async(req,res) => {
    try {
        var flink = req.body.flink;
        var slink = req.body.slink;
        var uid = req.body.uid;
        var uses = req.body.uses;
    
        db.collection("link").add({
          flink: flink,
          slink: slink,
          uid: uid,
          uses: uses,
        });
    
        res.send("Data berhasil disimpan");
      } catch (error) {
        res.send("Data gagal disimpan");
      }
})

router.get("/api/link", async(req,res) => {
    try{
        db.collection("link")
        .get()
        .then((querySnapshot)=>{
            let links = [];
            let id;
            querySnapshot.forEach((doc)=>{
                id = doc.id;
                links.push({id, ...doc.data()})
            })
            res.send(links)
        })
    }
    catch(err) {
        console.log(err)
    }
    
})

router.post("/api/login", async(req, res) => {
    let email = req.body.email
    let password = req.body.password
    try{
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;

            res.send(uid)
            
        })
        .catch((error) => {
            const errorCode = error.code;
            res.send(errorCode)
    });
    }
    catch(err){
        console.log(err)
    }
})

router.delete("/api/link/:id", async(req, res) => {
    try {
        db.collection("link")
        .doc(req.params.id)
        .delete()
        .then(() => {
            res.send("delete berhasil")
        })
    }
    catch(error){
        res.send(error)
        console.log(error)
    }
})

router.patch("/api/link/:id", async(req,res) => {
    try{
        db.collection("link")
        .doc(req.params.id)
        .update({
            flink: req.body.newflink,
            slink: req.body.newslink,
        })
        .then(() => {
            res.send("Berhasil Di update")
        })
    }
    catch(error) {
        res.send(error.message)
    }
})

router.get("/api/redirectLink", async (req, res) => {
    const url = req.query.url
    let id = ''
    let uses = 0
    let flink = ''
    console.log(url)
    try {
        const q = query(collection(db, "link"), where("slink", "==", url.replace("https://www.awikwokshort.my.id/", "")));

        console.log("masuk try")

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
            id = docSnap.id
            if (docSnap == null) {
                console.log("Cannot find associated link")
                res.send("Cannot find associated link")
            }
            else {
                const docData = docSnap.data()
                uses = parseInt(docData.uses)
                flink = docData.flink
                console.log(uses)
                console.log(flink)
                console.log(id)
                updateDoc(doc(db, "link", id), {
                    uses: uses + 1
                })
                console.log(uses)
            }
        });
        res.send(flink)
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
})


export default router;