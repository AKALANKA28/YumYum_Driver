import React from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface BlurredMapOverlayProps {
    opacity: Animated.Value;
    zIndex: number;
    mapReady?: boolean;
}

const BlurredMapOverlay = ({ opacity, zIndex, mapReady = false }: BlurredMapOverlayProps) => {
    // Don't render if zIndex is negative or map is not ready
    if (zIndex < 0 || !mapReady) return null;
    
    return (
        <Animated.View style={[styles.container, { opacity, zIndex }]}>
            {/* Main gradient overlay */}
            <LinearGradient
                colors={[
                    'rgb(255, 255, 255)', // Nearly fully white at top
                    'rgba(255, 255, 255, 0.85)', 
                    'rgba(255, 255, 255, 0.75)', 
                    'rgba(255, 255, 255, 0.65)',
                    'rgba(255, 255, 255, 0)', // Lighter at bottom
                ]}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={styles.gradient}
            />
            
            {/* Bottom gradient for smoother transition */}
            <LinearGradient
                colors={[
                    'rgba(255, 255, 255, 0.14)', 
                    'rgba(255, 255, 255, 0.31)'
                ]}
                style={styles.bottomGradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.3,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
});

export default BlurredMapOverlay;