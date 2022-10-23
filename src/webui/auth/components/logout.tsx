import { logout } from 'core/usecases';
import { Button } from 'webui/shared';

export const Logout = () => {
  const handleClick = async () => {
    try {
      await logout();
      alert('Successfull!');
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  return (
    <Button variant="primary-s" onClick={handleClick}>
      Log out
    </Button>
  );
};
