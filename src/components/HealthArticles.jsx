import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../features/theme/theme.context';

const { width } = Dimensions.get('window');

const ARTICLES = [
    {
        id: 1,
        title: "Your Amazing Uterus",
        type: 'diagram',
        image: require('../../assets/images/happy_uterus_diagram.png'),
        color: '#FCE4EC',
        darkColor: '#5c102b',
        textColor: '#C2185B',
        content: "Did you know? The uterus is the strongest muscle in your body by weight! It's an amazing, resilient organ."
    },
    {
        id: 2,
        title: "The 4 Phases",
        type: 'diagram',
        image: require('../../assets/images/cute_cycle_wheel.png'),
        color: '#FFF3E0',
        darkColor: '#4d2303',
        textColor: '#E65100',
        content: "Your cycle isn't just your period! It moves through 4 beautiful seasons: Menstrual (Winter), Follicular (Spring), Ovulation (Summer), and Luteal (Autumn)."
    },
    {
        id: 3,
        title: "Self Love Rituals",
        type: 'diagram',
        image: require('../../assets/images/self_love.png'),
        color: '#E3F2FD',
        darkColor: '#0a233b',
        textColor: '#1565C0',
        content: "• Take a warm bath 🛁\n• Read a cozy book 📖\n• Gentle stretching 🧘‍♀️\n• Hydrate deeply 💧"
    },
    {
        id: 4,
        title: "Hormone Harmony",
        type: 'diagram',
        image: require('../../assets/images/hormone_harmony.png'),
        color: '#F3E5F5',
        darkColor: '#2b0b3d',
        textColor: '#7B1FA2',
        content: "Estrogen rises in the first half, giving you energy. Progesterone rises later, making you feel cozy and reflective. Both are vital!"
    },
    {
        id: 5,
        title: "Food as Medicine",
        type: 'diagram',
        image: require('../../assets/images/food_as_medicine.png'),
        color: '#E8F5E9',
        darkColor: '#0c3014',
        textColor: '#2E7D32',
        content: "🍎 Menstrual: Warm soups & iron.\n🥦 Follicular: Fresh salads & probiotics.\n🍗 Ovulation: Fiber & antioxidants.\n🍠 Luteal: Complex carbs & root veggies."
    },
    {
        id: 6,
        title: "Sync Your Success",
        type: 'diagram',
        image: require('../../assets/images/sync_your_success.png'),
        color: '#FFF8E1',
        darkColor: '#362a03',
        textColor: '#F57F17',
        content: "Use your natural energy flow!\nStart new projects in Spring (Follicular), pitch big ideas in Summer (Ovulation), and finish focused work in Autumn (Luteal)."
    }
];

export const HealthArticles = () => {
    const { theme, isDarkMode } = useTheme();
    const isDark = isDarkMode;
    
    const cardWidth = width * 0.8;
    const cardGap = 20;
    const sidePadding = (width - cardWidth) / 2;

    return (
        <View style={styles.container}>
            <Text style={[styles.headerTitle, { color: theme.text, paddingHorizontal: 20 }]}>Body Wisdom 🌸</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 10 }}
                decelerationRate="fast"
                snapToInterval={cardWidth + cardGap}
                snapToAlignment="start"
            >
                {ARTICLES.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === ARTICLES.length - 1;
                    
                    const cardBg = isDark ? item.darkColor : item.color;
                    const textColor = isDark ? '#EEE' : item.textColor;
                    const titleColor = isDark ? '#FFF' : item.textColor;

                    return (
                        <View 
                            key={item.id} 
                            style={[
                                styles.card, 
                                { 
                                    backgroundColor: cardBg, 
                                    marginTop: 5,
                                    marginLeft: isFirst ? sidePadding : 0,
                                    marginRight: isLast ? sidePadding : cardGap,
                                    shadowColor: isDark ? '#000' : '#000',
                                    shadowOpacity: isDark ? 0.3 : 0.1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    borderWidth: isDark ? 1 : 0
                                }
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: titleColor }]}>{item.title}</Text>
                            </View>
                            
                            <Image source={item.image} style={styles.diagramImage} resizeMode="contain" />

                            <Text style={[styles.cardContent, { color: textColor }]}>
                                {item.content}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        marginHorizontal: -20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    card: {
        width: width * 0.8,
        height: 350, 
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        backgroundColor: 'white',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1, 
    },
    diagramImage: {
        width: '100%',
        height: 120, 
        alignSelf: 'center',
        marginVertical: 10,
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    }
});
