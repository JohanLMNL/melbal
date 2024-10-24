import { supabase } from '../supabaseClient'; // Assure-toi que le chemin est correct

export const signUpUserWithProfile = async (
  email,
  password,
  prenom,
  role
) => {
  try {
    // Étape 1 : Inscription de l'utilisateur
    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      return { error: signUpError.message }; // Retourner une erreur si l'inscription échoue
    }

    // Étape 2 : Vérifier si l'email existe déjà dans la table `profiles`
    const { data: existingProfile, error: checkError } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single(); // Utilise .single() pour récupérer une seule ligne

    if (checkError && checkError.code !== 'PGRST116') {
      // Si l'erreur n'est pas "no rows"
      return { error: checkError.message };
    }

    if (existingProfile) {
      return {
        error:
          'Un utilisateur avec cette adresse e-mail existe déjà.',
      }; // Message d'erreur
    }

    // Étape 3 : Créer le profil avec l'e-mail et initialiser `isActive` à true
    const { data, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          email: email, // Utiliser l'email pour identifier le profil
          prenom: prenom,
          role: role,
          isActive: true, // Initialiser `isActive` à true
        },
      ]);

    if (profileError) {
      return { error: profileError.message }; // Retourner une erreur si l'ajout du profil échoue
    }

    // Retourner un succès
    return { success: true };
  } catch (error) {
    return { error: error.message }; // Gestion des erreurs éventuelles
  }
};
