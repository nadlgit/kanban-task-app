import { DEMO_ROUTE } from 'webui/routes';
import { LinkButton } from 'webui/shared';

export const OpenDemo = () => (
  <LinkButton url={DEMO_ROUTE} variant="primary-s" fullWidth={false}>
    Try demo
  </LinkButton>
);
