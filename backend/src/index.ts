import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import storyRoutes from './routes/story';
import teamMemberRoutes from './routes/teamMember';
import chartRoutes from './routes/chart';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/team-member', teamMemberRoutes);
app.use('/api/chart', chartRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
