// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, query, where, getDocs, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import { ref, getStorage, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4AWMEa9h2ywpuk30bnqZLJXRxceYX6GI",
  authDomain: "no-cry-shy.firebaseapp.com",
  projectId: "no-cry-shy",
  storageBucket: "no-cry-shy.appspot.com",
  messagingSenderId: "451941160416",
  appId: "1:451941160416:web:4074cc72e7f37c638d0785",
  measurementId: "G-T60BP6MLNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const storage = getStorage();

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
	signInWithPopup(auth, provider).then(async (result) => {
		let userEntry = await getUserDetails(result.user.email);
		if (!userEntry.exists()) {
			let firstName = result.user.displayName.split(' ').slice(0, -1).join(' ');
			let lastName = result.user.displayName.split(' ').slice(-1).join(' ');
			await addUserDetails(firstName, lastName, result.user.email, false);
		} 
		window.location.reload();
	}).catch((error) => {
		alert(error);
	});
}

export const signOutWithGoogle = () => {
	signOut(auth).then(function() {
	 	window.location.replace("/");
	}, function(error) {
	  	console.log('Sign Out Error', error);
	});
}

// Firestore Methods
const userDetailsCollection = collection(db, "Users");
const entriesCollection = collection(db, "Entries");

export const getUserDetails = async (email) => {
	if (!email) return null;
	const docRef = doc(db, "Users", email);
	return await getDoc(docRef);
}

export const addUserDetails = async (firstName, lastName, email, update = true) => {
	if (update) {
		await updateDoc(doc(userDetailsCollection, email), {
		    firstName: firstName, lastName: lastName });
	} else {
		await setDoc(doc(userDetailsCollection, email), {
		    firstName: firstName, lastName: lastName });
	}
}

export const addEntry = async (uid, date, time, timezone, severity, reason, other, share, photo_url) => {
	const entryData = {
		uid: uid, date: date,
		time: time, timezone: timezone, severity: severity, reason: reason, other: other, share: share, photo_url: photo_url
	}
	await setDoc(doc(entriesCollection), entryData);
}

export const editEntry = async (id, uid, date, time, timezone, severity, reason, other, share, photo_url) => {
	const entryData = {
		uid: uid, date: date, 
		time: time, timezone: timezone, severity: severity, reason: reason, other: other, share: share, photo_url: photo_url
	}
	await setDoc(doc(entriesCollection, id), entryData);
}

export const deleteEntry = async (id) => {
	await deleteDoc(doc(entriesCollection, id));
}

export const getEntries = async (uid) => {
	// Create a query against the collection.
	const q = query(entriesCollection, where("uid", "==", uid));
	return await getDocs(q);
}

export const constructImageName = (username, post_id) => {
	return `/${username}/${post_id}`;
}

// Upload photo to Firebase storage for the filename
export const uploadPhotoToStorage = async (filename, file) => {
	const storageRef = ref(storage, filename);

	await uploadBytes(storageRef, file);
};

// Upload photo to Firebase storage for the user
export const getPhotoDownloadURL = async (filename) => {
	return await getDownloadURL(ref(storage, filename));
};

// Delete photo from Firebase Storage using its download URL
export const deletePhoto = async (url) => {
	const fileRef = ref(storage, url);
  	await deleteObject(fileRef);
};	

// Friend Firetstore functions
export const addFriendRequest = async(personalEmail, friendEmail) => {
	await updateDoc(doc(userDetailsCollection, friendEmail), {pendingRequests:arrayUnion(personalEmail)});
	await updateDoc(doc(userDetailsCollection, personalEmail), {sentFriendRequests:arrayUnion(friendEmail)});
}

// Accept a friend request. Must have been added to the relevant users firestore collections
export const acceptFriendRequest = async(personalEmail, friendEmail) => {
	// Remove emails from the pendingRequests field
	await updateDoc(doc(userDetailsCollection, friendEmail), {sentFriendRequests:arrayRemove(personalEmail)});
	await updateDoc(doc(userDetailsCollection, personalEmail), {pendingRequests:arrayRemove(friendEmail)});

	// Add as friend
	await updateDoc(doc(userDetailsCollection, personalEmail), {friends:arrayUnion(friendEmail)});
	await updateDoc(doc(userDetailsCollection, friendEmail), {friends:arrayUnion(personalEmail)});
	window.location.reload();
}

// Delete a friend request. Must have been added to the relevant users firestore collections
export const deleteFriendRequest = async(personalEmail, friendEmail) => {
	// Remove emails from the pendingRequests field
	await updateDoc(doc(userDetailsCollection, friendEmail), {sentFriendRequests:arrayRemove(personalEmail)});
	await updateDoc(doc(userDetailsCollection, personalEmail), {pendingRequests:arrayRemove(friendEmail)});
	window.location.reload();
}

// Delete a sent friend request. Must have been added to the relevant users firestore collections
export const deleteSentFriendRequest = async(personalEmail, friendEmail) => {
	// Remove emails from the pendingRequests field
	await updateDoc(doc(userDetailsCollection, personalEmail), {sentFriendRequests:arrayRemove(friendEmail)});
	await updateDoc(doc(userDetailsCollection, friendEmail), {pendingRequests:arrayRemove(personalEmail)});
	window.location.reload();
}

// Delete a friend request. Must have been added to the relevant users firestore collections
export const deleteFriend = async(personalEmail, friendEmail) => {
	// Remove emails from the pendingRequests field
	await updateDoc(doc(userDetailsCollection, friendEmail), {friends:arrayRemove(personalEmail)});
	await updateDoc(doc(userDetailsCollection, personalEmail), {friends:arrayRemove(friendEmail)});
	window.location.reload();
}
