import { getPreferences, createPreferences, updatePreferences, deletePreferences } from '../controller/preferencesController.js';

const router = express.Router();
router.get('/', getPreferences);
router.post('/', createPreferences);
router.put('/:id', updatePreferences);
router.delete('/:id', deletePreferences);

export default router; 