'use client' // client-sided app
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)

  const [searchQuery, setSearchQuery] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList);
  }

  const handleDeleteDialogOpen = async (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = async (item) => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }

  const deleteItem = async (item) => {
    if (!itemToDelete) return;
    const docRef = doc(collection(firestore, 'inventory'), itemToDelete);

    try {
      // Delete the document from the collection
      await deleteDoc(docRef);
      // Update the inventory list
      await updateInventory();
      // Close the delete dialog
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (quantity == 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {quantity: quantity - 1});
      }
    }

    await updateInventory();
  }

  // // Simple pluralization function
  // const pluralize = (word) => {
  //   if (word.endsWith('s')) {
  //     return word.substring(0, word.length-1);
  //   }
  //   // More rules can be added for complex cases
  //   return word;
  // };

  const addItem = async (item, quantity) => {
    const itemNameLower = item.toLowerCase();
    
    const docRef = doc(collection(firestore, 'inventory'), itemNameLower);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity: existingQuantity} = docSnap.data();
      await setDoc(docRef, {quantity: existingQuantity + quantity});
    }
    else {
      await setDoc(docRef, {quantity});
    }

    await updateInventory();
  }

  useEffect(() => {
    updateInventory();
  }, [])

  const handleOpen = () => {
    setItemQuantity(1);
    setOpen(true);
  }
  const handleClose = () => {
    setItemName('');
    setOpen(false);
  }

  {/* Handles adding an item to the inventory */}
  const handleAddItem = () => {
    if (itemName.trim() === '' || itemQuantity <= 0) return;
    addItem(itemName, itemQuantity);
    setItemName('');
    setItemQuantity(1);
    handleClose();
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
        width={400}
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          transform: 'translate(-50%, -50%)',
          bgcolor: "white",
          border: "2px solid black"
        }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant='outlined'
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
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

      <Stack direction="row" spacing={2}>
        <Button 
        variant="contained"
        onClick={() => {
          handleOpen()
        }}
        sx={{bgcolor:"#2A5E21", color: "white", minWidth: "150px"}}
        >
          Add New Item
        </Button>

        <TextField
          variant='outlined'
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          placeholder="Search Item"
          sx={{ marginBottom: 2 }}
        />

      </Stack>

      <Box border ='4px solid #2A5E21' borderRadius="8px">
        <Box
        width='800px'
        height="100px"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{bgcolor: "#8BC34A", color: "white", hover: "#8BC34A"}}
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {
          filteredInventory.map(({name, quantity}) => (
            <Box 
            key={name} 
            width="100%" 
            minHeight="150px" 
            borderRadius="8px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            padding={5}
            >
              <Typography 
              variant="h3" 
              color = "#333" 
              textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)} 
              </Typography>

              {/* stack container for quantity and associated buttons */}
              <Stack direction="row" spacing={2} alignItems="center">

              {/* Subtract Item by 1 */}
              <Button variant="contained" onClick={() => {
                  removeItem(name)
                }}
                sx={{ fontSize: '1.5rem', padding: '4px 4px', minWidth: '32px', height: '32px' }}
              >-</Button>

                <Typography 
                variant="h3" 
                color = "#333" 
                textAlign="center">
                  {quantity} 
                </Typography>

                {/* Add Item by 1 */}
                <Button variant="contained" onClick={() => {
                  addItem(name, 1)
                }}
                sx={{ fontSize: '1.5rem', padding: '4px 4px', minWidth: '32px', height: '32px' }}
                >+</Button>

                {/* Delete confirmation */}
                <Button variant="contained" onClick={() => handleDeleteDialogOpen(name)}
                sx={{ fontSize: '1.1rem', padding: '8px 8px', minWidth: '100px', minHeight: '48px' }}
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
          ))
        }
      </Stack>
      </Box>
    </Box>
  )
}
