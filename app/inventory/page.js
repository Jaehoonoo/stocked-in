'use client' // client-sided app
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { firestore, auth } from '@/firebase';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        setUser(null);
        setInventory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateInventory = async (userId) => {
    if (!userId) return;
    const inventoryRef = collection(firestore, `users/${userId}/inventory`);
    const snapshot = query(inventoryRef);
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  }

  const handleDeleteDialogOpen = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }

  const deleteItem = async () => {
    if (!itemToDelete || !user) return;
    const docRef = doc(firestore, `users/${user.uid}/inventory`, itemToDelete);

    try {
      await deleteDoc(docRef);
      await updateInventory(user.uid);
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  }

  const removeItem = async (item) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/inventory`, item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(user.uid);
  }

  const addItem = async (item, quantity) => {
    if (!user) return;
    const itemNameLower = item.toLowerCase();
    const docRef = doc(firestore, `users/${user.uid}/inventory`, itemNameLower);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }

    await updateInventory(user.uid);
  }

  const handleOpen = () => {
    setItemQuantity(1);
    setOpen(true);
  }

  const handleClose = () => {
    setItemName('');
    setOpen(false);
  }

  const handleAddItem = () => {
    if (itemName.trim() === '' || itemQuantity <= 0) return;
    addItem(itemName, itemQuantity);
    setItemName('');
    setItemQuantity(1);
    handleClose();
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth')
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery)
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      sx={{ p: { xs: 2, sm: 4 }, // Adjust padding based on screen size
            maxWidth: '100%', // Ensure box doesn't exceed viewport width
          }}
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          borderRadius="8px"
          width={{ xs: '90vw', sm: '80vw', md: 400 }} // Responsive width
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            bgcolor: "white",
            border: "2px solid black"
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Name"
            />
            <TextField
              variant='outlined'
              fullWidth
              value={itemQuantity}
              onChange={(e) => {
                const value = e.target.value;
                setItemQuantity(value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1));
              }}
              placeholder="Quantity"
              inputProps={{ min: 1 }}
            />
            <Button
              variant='outlined'
              onClick={handleAddItem}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="space-between">
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ bgcolor: "#2A5E21", color: "white", minWidth: "150px", '&:hover': { bgcolor: '#06402B' } }}
        >
          Add New Item
        </Button>

        <TextField
          variant='outlined'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          placeholder="Search Item"
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#2A5E21',
              },
              '&:hover fieldset': {
                borderColor: '#2A5E21',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2A5E21',
              },
            },
            '& .MuiInputBase-input': {
              color: '#333',
            },
            maxWidth: { xs: '100%', sm: '300px' } // Responsive maxWidth
          }}
        />

        <Button
          variant="contained"
          onClick={handleSignOut}
          sx={{ bgcolor: "#2A5E21", color: "white", minWidth: "150px", '&:hover': { bgcolor: '#06402B' } }}
        >
          Sign Out
        </Button>
      </Stack>

      <Box border='4px solid #2A5E21' borderRadius="10px" sx={{ width: { xs: '100%', sm: '90%', md: '800px' } }}>
        <Box
          height="100px"
          borderRadius="4px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ bgcolor: "#2A5E21", color: "#F8F2ED" }}
        >
          <Typography variant="h2" color="#F8F2ED">
            Inventory Items
          </Typography>
        </Box>
        <Stack
          height="400px"
          spacing={2}
          overflow="auto"
          sx={{
            '::-webkit-scrollbar': {
              display: 'none',
            },
            '-ms-overflow-style': 'none', /* IE and Edge */
            'scrollbar-width': 'none', /* Firefox */
          }}
        >
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#E8FAEA"
              padding={5}
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }} // Responsive layout
            >
              <Typography
                variant="h3"
                color="#333"
                textAlign="center"
                sx={{
                  fontSize: { xs: '1.2rem', sm: '1.2rem', md: '2rem', lg: '2.5rem' },
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" marginLeft = '2rem'>
                <Button variant="contained" onClick={() => removeItem(name)}
                  sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, padding: '4px 8px', minWidth: '32px', height: '32px', bgcolor: "#2A5E21", '&:hover': { bgcolor: '#06402B' } }}
                >-</Button>

                <Typography
                  variant="h3"
                  color="#333"
                  textAlign="center"
                >
                  {quantity}
                </Typography>

                <Button variant="contained" onClick={() => addItem(name, 1)}
                  sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, padding: '4px 8px', minWidth: '32px', height: '32px', bgcolor: "#2A5E21", '&:hover': { bgcolor: '#06402B' } }}
                >+</Button>

                <Button variant="contained" onClick={() => handleDeleteDialogOpen(name)}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, padding: '8px 16px', minWidth: '100px', minHeight: '48px', bgcolor: "#2A5E21", '&:hover': { bgcolor: '#06402B' } }}
                >Delete</Button>

                <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this item?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color="primary">No</Button>
                    <Button onClick={deleteItem} color="secondary">Yes</Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>

  )
}
