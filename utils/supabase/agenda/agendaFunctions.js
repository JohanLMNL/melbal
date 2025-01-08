import { supabase } from '../supabaseClient';

export const getAllAgenda = async () => {
  try {
    const { data, error } = await supabase.from('agenda').select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching agenda:', error);
    return [];
  }
};

export const getNextEvents = async () => {
  try {
    const now = new Date().toISOString(); // Date actuelle au format ISO
    const { data: firstEvent, error: firstError } = await supabase
      .from('agenda')
      .select('*')
      .gte('date', now) // Filtrer par date >= maintenant
      .order('date', { ascending: true }) // Trier par ordre croissant
      .limit(1); // Récupérer uniquement le prochain événement

    if (firstError) {
      throw firstError;
    }

    if (!firstEvent || firstEvent.length === 0) {
      return []; // Aucun événement trouvé
    }

    const closestDate = firstEvent[0].date; // Date du prochain événement
    const { data: allEvents, error: allError } = await supabase
      .from('agenda')
      .select('*')
      .eq('date', closestDate); // Récupérer tous les événements de cette date

    if (allError) {
      throw allError;
    }

    return allEvents || [];
  } catch (error) {
    console.error('Error fetching next events:', error);
    return [];
  }
};
