'use client'
import React, { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, List, ListItem, ListItemText, ListItemButton, CircularProgress, Card, CardContent } from "@mui/material";
import { firestore } from '@/firebase';
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/app/firebase/config"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      return '';
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return ''; 
  }
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userSession, setUserSession] = useState("user");
  const [loadingTime, setLoading] = useState(false);
  const [recipeSuggestions, setSuggestions] = useState('');
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
  const addItem = async () => {
    if (!itemName.trim()) return; // Ensure itemName is not empty

    const docRef = doc(collection(firestore, "pantry"), itemName);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
  
    await updatePantry();
    handleClose(); // Close the modal after adding the item
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

  // edit this function
  const getPantryItems = async () => {
    const snapshot = collection(firestore, "pantry");
    const docs = await getDocs(snapshot);
    const pantryList = docs.docs.map(doc => doc.id); // Assuming the item name is the document ID
    return pantryList;
  };

  // Gets the recipes
  const GetTheRecipes = async () => {
    // loads in the recipes
    setLoading(true);
    const pantryItems = await getPantryItems();

    // OpenAI posts the list of recipes
    const response = await fetch('/api/recipe-suggestions', {
      // post request to show the list of recipes
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: pantryItems }), 
    });

    const Getdata = await response.json();
    setSuggestions(Getdata.recipe); 
    setLoading(false);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start" // Align items at the top
      alignItems="center"
      sx={{ p: 2, bgcolor: '#f5f5f5', overflowY: 'auto' }} // Main page scrolling
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 2, flexWrap: 'wrap', width: '100%', maxWidth: '1200px' }}
      >
        <TextField
          label="Search item"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" 
        sx={{ mt: 2, color:"#000", backgroundColor:"#7a8aff", "&:hover": {backgroundColor: "#6270d9"}}}
        onClick={handleSearch}>Search</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={GetTheRecipes}
          sx={{ mt: 2, color:"#000", backgroundColor:"#c986fc", "&:hover": {backgroundColor: "#b352ff"}}}
          disabled={loadingTime}
        >
          {loadingTime ? <CircularProgress size={24} /> : 'View Recipes'}
        </Button>
        <Button
          variant="outlined"
          sx={{color:"#000", backgroundColor:"#ff6161", "&:hover": {backgroundColor: "#f24646"}}}
          onClick={() => {
            signOut(auth);
            sessionStorage.removeItem("user");
            router.push("/sign-up");
          }}
        >
          Sign Out
        </Button>
      </Stack>

      <Box
        width="100%"
        maxWidth="1200px"
        borderRadius={2}
        sx={{ mb: 2, bgcolor: '#fff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} // pantry background color
      >
        <Box
          width="100%"
          height="auto"
          bgcolor="#4CAF50"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={5}
          py={2}
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h4"
            color="#fff"
            textAlign="left"
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

        <List>
        {filteredPantry.map((item) => (
          <ListItem key={item.name}>
            <ListItemButton>
            {<Typography sx={{ color: 'black' }}>{item.name}</Typography>}
              <ListItemText
                secondary={<Typography sx={{ color: 'black' }}>Quantity: {item.count}</Typography>}
              />
        <Button
          sx={{
            backgroundColor: "#77d761",
            color: 'white',
            fontSize: '0.75rem',
            padding: '4px 8px',
            minWidth: '32px',
            borderRadius: '4px',
            marginRight: '8px',
            '&:hover': {
              backgroundColor: "#66bb6a", // darker green for hover
              color: 'white',
            },
            '&:active': {
              backgroundColor: "#4caf50", // green shade for active
              color: 'white',
            }
          }}
          onClick={() => incrementQuantity(item.name)}
        >
          +
        </Button>

        <Button
          sx={{
            backgroundColor: "#d26b6b",
            color: 'white',
            fontSize: '0.75rem',
            padding: '4px 8px',
            minWidth: '32px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: "#c75b5b", // darker red for hover
              color: 'white',
            },
            '&:active': {
              backgroundColor: "#b94a4a", // red shade for active
              color: 'white',
            }
          }}
          onClick={() => decrementQuantity(item.name)}
        >
          -
        </Button>
              <Button color="error" onClick={() => removeItem(item.name)}>Remove</Button>
            </ListItemButton>
    </ListItem>
))}
        </List>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2" color="black">
            Add to Pantry
          </Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="contained"
            color="success" // button for when you click Add Items button
            onClick={addItem}
            sx={{ mt: 2 }}
          >
            Add Item
          </Button>
        </Box>
      </Modal>

      <Box
        width="100%"
        maxWidth="1200px"
        p={2}
        sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', mt: 2, color: "#000", px: 2 }}
      >
        <Typography variant="h5" component="h2" mb={2}>
          Recipe Suggestions
        </Typography>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ pl: 2 }}> {/* Adding padding-left to the Box wrapping ReactMarkdown */}
              <ReactMarkdown children={recipeSuggestions} remarkPlugins={[remarkGfm]} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
