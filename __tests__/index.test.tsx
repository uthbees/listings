import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Listings from '@/components/Listings';

describe('No config', () => {
    it('shows a no videos message', () => {
        const { getByTestId } = render(<Listings appConfig={{}} />);

        const noVideosMessage = getByTestId('noVideosMessage');

        expect(noVideosMessage).toBeInTheDocument();
        expect(noVideosMessage).not.toBeEmptyDOMElement();
    });
});
