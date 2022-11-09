import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { TextField } from './text-field';

let userEvt = userEvent.setup();

const getDeleteBtnElt = (shouldBePresent: boolean) =>
  shouldBePresent
    ? screen.getByRole('button', { name: /delete/i })
    : screen.queryByRole('button', { name: /delete/i });
const getLabelElt = (label: string) => screen.getByText(label);
const visuallyHiddenClass = 'visually-hidden';

describe('TextField component', () => {
  it('should handle missing onDelete props', () => {
    const testProps = {
      name: faker.datatype.uuid(),
      label: faker.lorem.words(),
    };

    userEvt = userEvent.setup();
    render(<TextField {...testProps} />);

    expect(getDeleteBtnElt(false)).not.toBeInTheDocument();
  });

  it('should handle defined onDelete', async () => {
    const testProps = {
      name: faker.datatype.uuid(),
      label: faker.lorem.words(),
      onDelete: jest.fn(),
    };

    userEvt = userEvent.setup();
    render(<TextField {...testProps} />);

    await userEvt.click(getDeleteBtnElt(true) as HTMLElement);
    expect(testProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should handle missing hideLabel props', () => {
    const testProps = {
      name: faker.datatype.uuid(),
      label: faker.lorem.words(),
    };

    userEvt = userEvent.setup();
    render(<TextField {...testProps} />);

    expect(getLabelElt(testProps.label)).not.toHaveClass(visuallyHiddenClass);
  });

  it('should handle hideLabel=true', () => {
    const testProps = {
      name: faker.datatype.uuid(),
      label: faker.lorem.words(),
      hideLabel: true,
    };

    userEvt = userEvent.setup();
    render(<TextField {...testProps} />);

    expect(getLabelElt(testProps.label)).toHaveClass(visuallyHiddenClass);
  });
});
