import { getUserProfile } from '../../utils/hooks/getUserProfile';

const DbTitle = async () => {
  const user = await getUserProfile();

  if (!user) {
    return <h2>Vous n'êtes pas connecté</h2>;
  }

  return (
    <div>
      <h1>Adresse e-mail : {user.email}</h1>
      <h2>Prénom : {user.prenom}</h2>
      <p>Statut actif : {user.isActive ? 'Oui' : 'Non'}</p>
    </div>
  );
};

export default DbTitle;
