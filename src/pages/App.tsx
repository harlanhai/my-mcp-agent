import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '@/utils/muiTheme';

import McpComponent from '@components/McpComp';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <McpComponent />
    </ThemeProvider>
  );
}

App.whyDidYouRender = true; // Enable WDYR for this component
export default App;
