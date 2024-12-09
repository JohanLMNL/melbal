import { supabase } from '../supabase/supabaseClient';

export const getAllReservations = async () => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};

export const getTodayReservations = async () => {
  const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', today);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching today's reservations:", error);
    return [];
  }
};

export const getTodayReservationsForSalle = async (salle) => {
  const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', today)
      .eq('salle', salle);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching today's reservations:", error);
    return [];
  }
};

export const addReservation = async ({
  salle,
  nom,
  nombre,
  tel,
  date,
  heure,
  commentaire,
  acompte,
  table,
  AddBy, // Ajout de AddBy (l'utilisateur qui ajoute la réservation)
}) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          salle,
          nom,
          nombre,
          tel,
          date, // Format 'YYYY-MM-DD'
          heure, // Format 'HH:MM'
          commentaire,
          acompte,
          table,
          AddBy, // Ajouter le champ AddBy ici
        },
      ])
      .select(); // Récupérer les données insérées

    if (error) {
      console.error('Supabase Error:', error.message);
      throw error;
    }

    console.log('Data returned from Supabase:', data);

    return data;
  } catch (error) {
    console.error('Error adding reservation:', error);
    return null;
  }
};

export const fetchResaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single(); // Assurez-vous qu'il n'y a qu'une seule ligne renvoyée

    if (error) {
      console.error(
        'Error fetching reservation by id:',
        error.message
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching reservation by id:', error);
    return null;
  }
};

export const deleteResaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Error deleting reservation by id:',
        error.message
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting reservation by id:', error);
    return null;
  }
};

export const updateResaById = async (id, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update(updatedData)
      .eq('id', id)
      .select(); // Optionnel : pour récupérer les données mises à jour

    if (error) {
      console.error(
        'Error updating reservation by id:',
        error.message
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating reservation by id:', error);
    return null;
  }
};

export const getReservationsByDate = async (date) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', date);

    if (error) {
      console.error(
        'Error fetching reservations by date:',
        error.message
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching reservations by date:', error);
    return [];
  }
};

