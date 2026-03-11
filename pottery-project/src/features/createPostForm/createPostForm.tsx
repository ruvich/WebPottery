import { Box, Button, Dialog, DialogTitle } from "@mui/material";

type Props = { open: boolean; onClose: () => void };

export const CreatePostForm = ({ open, onClose }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать пост</DialogTitle>

      <Box sx={{ p: 2 }}>
        <Button variant="contained" onClick={() => console.log("Создать")}>
          Создать
        </Button>
        <Button variant="outlined" onClick={onClose} sx={{ ml: 1 }}>
          Отмена
        </Button>
      </Box>
    </Dialog>
  );
};