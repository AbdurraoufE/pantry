'use client'
import React, { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Grid } from "@mui/material";
import { firestore } from '@/firebase';
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/app/firebase/config"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

const fetchImageFromUnsplash = async (query) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=YOUR_UNSPLASH_ACCESS_KEY`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    } else {
      return ''; // Return an empty string or a default image URL if no results are found
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return ''; // Return an empty string or a default image URL in case of an error
  }
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userSession, setUserSession] = useState("user");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserSession(sessionStorage.getItem("user"));
    }
  }, []);

  // check if user is authenticated
  if (!user && !userSession) {
    router.push("/sign-up")
  }

  // update pantry function
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    setFilteredPantry(
      pantry.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, pantry]);

  // Function: handle the add item button
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
  
    await updatePantry();
  };
  
  // Function: handle the remove item button
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  // Function: handles the search button
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredPantry(pantry);
    } else {
      const searchResult = pantry.filter((item) =>
        item.name.toLowerCase() === searchTerm.toLowerCase()
      );
      setFilteredPantry(searchResult);
    }
  };

  // Function: handles the increment button
  const incrementQuantity = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 }, { merge: true });
      await updatePantry();
    }
  };

  // Function: handles the decrement button
  const decrementQuantity = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 }, { merge: true });
      } else {
        await deleteDoc(docRef);
      }
      await updatePantry();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection={"column"}
      gap={2}
    >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ color: 'black' }} // Set the text color to black
            >
              Add an item
            </Typography>
            <Stack width="100%" direction={"row"} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{marginBottom: 2}}
      >
      <TextField
        label="Search item"
        variant='outlined'
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" onClick={handleSearch}>Search</Button>
      <Button
              variant="outlined"
              onClick={() => {
                signOut(auth);
                sessionStorage.removeItem("user");
                // route to sign up page
                router.push("/sign-up")
              }}
            >
              SignOut
            </Button>
      </Stack>
      <Box border={"1px solid #333"}>
        <Box
          width={"1500px"}
          height={"100px"}
          bgcolor={"#b3946b"}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          paddingX={5}
        >
          <Typography
            variant={"h2"}
            color={"#232b2b"}
            textAlign={"left"}
          >
            Your Pantry
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ borderRadius: '15px', padding: '8px 16px', '&:hover': { bgcolor: '#28c628' } }}
            onClick={handleOpen}
          >
            Add Items
          </Button>
        </Box>
        <Box
          width={"1500px"}
          height={"300px"} // Set a fixed height
          overflow={"auto"} // Enable scrolling if needed
          padding={2}
        >
        <Grid container spacing={2}>
          {filteredPantry.map((item) => (
            <Grid item xs={6} md={4} lg={3} key={item.name}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                border="1px solid #ccc"
                borderRadius="8px"
                padding={2}
              >
                {/* <img src={item.imageUrl} alt={item.name} style={{ width: '100px', height: '100px' }} /> */}
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2">Quantity: {item.count}</Typography>
                <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                  <Box display="flex" gap={1} mb={1}>
                    <Button
                      onClick={() => incrementQuantity(item.name)}
                      sx={{
                        backgroundColor: "#4caf50", // Green color
                        color: "#fff",
                        borderRadius: '4px',
                        padding: '4px 8px',
                        '&:hover': {
                          backgroundColor: "#388e3c", // Darker green on hover
                        },
                        fontSize: '0.9rem',
                      }}
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => decrementQuantity(item.name)}
                      sx={{
                        backgroundColor: "#f44336", // Red color
                        color: "#fff",
                        borderRadius: '4px',
                        padding: '4px 8px',
                        '&:hover': {
                          backgroundColor: "#c62828", // Darker red on hover
                        },
                        fontSize: '0.9rem',
                      }}
                    >
                      -
                    </Button>
                  </Box>
                  <Button
                    onClick={() => removeItem(item.name)}
                    sx={{
                      backgroundColor: "#e64a19", // Darker red color
                      color: "#fff",
                      borderRadius: '4px',
                      padding: '4px 8px',
                      '&:hover': {
                        backgroundColor: "#d84315", // Darker shade on hover
                      },
                      fontSize: '0.9rem',
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        </Box>
      </Box>
    </Box>
  );
}
