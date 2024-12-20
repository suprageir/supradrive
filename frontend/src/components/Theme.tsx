import { createTheme, ThemeProvider } from '@mui/material';
import React from 'react';

export function Theme({ children }: { children: any }) {
    const userTheme = localStorage.getItem('jvtheme') || "light";

    var theme = createTheme({
        components: {
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        maxWidth: 'none',
                        fontSize: '1em'
                    }
                }
            }
        },
        palette: { mode: 'light' }
    });

    if (userTheme === "dark") {
        theme = createTheme({
            components: {
                MuiTooltip: {
                    styleOverrides: {
                        tooltip: {
                            maxWidth: 'none',
                            fontSize: '1em'
                        }
                    }
                }
            },
            palette: { mode: 'dark' }
        });
    }


    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
};
