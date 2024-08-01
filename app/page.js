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

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem("user");


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
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
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
    if (docSnap.exists()){
      const {count} = docSnap.data();
      await setDoc(docRef, {count: count +1});
    }
    await updatePantry();
  }

  // Function: handles the increment button
  const decrementQuantity = async (item) => {
    const docRef =  doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()){
      const {count} = docSnap.data();
      if (count === 1){
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {count: count -1});
      }
    }
    await updatePantry();
  }

  return (
    // add signout button here for ppl to sign out
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
          <Typography id="modal-modal-title" variant="h6" component="h2">
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
              }}
            >
              SignOut
            </Button>
      </Stack>
      <Box border={"1px solid #333"}>
        <Box
          width={"1500px"}
          height={"100px"}
          bgcolor={"#b9e2f5"}
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
          <Grid item xs={6}><Typography variant="h6">Item</Typography></Grid>
          <Grid item xs={3}><Typography variant="h6">Quantity</Typography></Grid>
          <Grid item xs={3}><Typography variant="h6">Task</Typography></Grid>
          {filteredPantry.map(({ name, count }) => (
            <React.Fragment key={name}>
              <Grid item xs={6}>
                <Typography>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  <Button
                    variant='outlined'
                    color="success"
                    onClick={() => incrementQuantity(name)}
                    sx={{ minWidth: '24px', height: '24px' }}
                  >+ </Button>
                  <Typography>{count}</Typography>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => decrementQuantity(name)}
                    sx={{ minWidth: '24px', height: '24px' }}
                  >-</Button>
                </Stack>
              </Grid>
              <Grid item xs={3}>
                <Button
                  variant='contained'
                  color="error"
                  sx={{ borderRadius: '15px', padding: '8px 16px', '&:hover': { bgcolor: '#c62828' } }}
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        </Box>
      </Box>
    </Box>
  );
}
