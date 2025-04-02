import { supabase } from '../supabaseClient';

export const getAllAgenda = async () => {
  try {
    const { data, error } = await supabase.from('agenda').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching agenda:', error);
    return [];
  }
};

export const getNextEvents = async () => {
  try {
    const now = new Date().toISOString();
    const { data: firstEvent, error: firstError } = await supabase
      .from('agenda')
      .select('*')
      .gte('date', now)
      .order('date', { ascending: true })
      .limit(1);

    if (firstError) throw firstError;
    if (!firstEvent || firstEvent.length === 0) return [];

    const closestDate = firstEvent[0].date;
    const { data: allEvents, error: allError } = await supabase
      .from('agenda')
      .select('*')
      .eq('date', closestDate);

    if (allError) throw allError;
    return allEvents || [];
  } catch (error) {
    console.error('Error fetching next events:', error);
    return [];
  }
};

export const createAgenda = async ({ evenement, date, salle }) => {
  console.log('🧾 Données envoyées à Supabase :', {
    evenement,
    date,
    salle,
  });

  const { data, error } = await supabase
    .from('agenda')
    .insert([{ evenement, date, salle }]);

  if (error) {
    console.error('❌ Erreur Supabase :', error);
    throw error;
  }

  console.log('✅ Données créées :', data);
  return data;
};
export const deleteAgenda = async (id) => {
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression :', error);
    throw error;
  }
};
