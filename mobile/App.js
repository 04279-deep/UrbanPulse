import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StatusBar,
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');

  // Report state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road_damage');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Sample data
  const sampleComplaints = [
    {
      id: 'UP-2026-01001',
      title: 'Pothole Cluster on Main Ring Road',
      category: 'Road Damage',
      severity: 'Critical',
      status: 'In Progress',
      ward: 'Ward 12 - Civic District',
      time: '2 hours ago',
    },
    {
      id: 'UP-2026-01002',
      title: 'Overflowing Waste Dumpster',
      category: 'Solid Waste',
      severity: 'High',
      status: 'Submitted',
      ward: 'Ward 8 - Commerce Hub',
      time: '4 hours ago',
    },
    {
      id: 'UP-2026-01003',
      title: 'Submerged Road Junction',
      category: 'Drainage & Floods',
      severity: 'Critical',
      status: 'Assigned',
      ward: 'Ward 15 - Riverside',
      time: '6 hours ago',
    },
  ];

  const handleReportSubmit = () => {
    if (!title || !description) {
      Alert.alert('Required Fields', 'Please enter incident title and description.');
      return;
    }
    const newId = `UP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedTicket(newId);
    Alert.alert(
      'AI Incident Verified',
      `Complaint registered as ${newId}. Computer Vision confidence 94%. Dispatched to Municipal Squad. +10 Civic Points earned!`,
      [{ text: 'OK', onPress: () => setActiveTab('feed') }]
    );
    setTitle('');
    setDescription('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Urban<Text style={styles.headerHighlight}>Pulse</Text>
          </Text>
          <View style={styles.liveIndicator}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>AI MESH LIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>85 PTS</Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content based on Active Tab */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'feed' && (
          <View style={styles.tabContainer}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Civic Incident Feed</Text>
              <Text style={styles.heroSubtitle}>
                Real-time geotagged problems verified by UrbanPulse computer vision.
              </Text>
            </View>

            {sampleComplaints.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.ticketId}>{item.id}</Text>
                  <View
                    style={[
                      styles.severityPill,
                      item.severity === 'Critical' ? styles.criticalPill : styles.highPill,
                    ]}
                  >
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.category} • {item.ward}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.statusText}>Status: {item.status}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'report' && (
          <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Report Civic Problem</Text>
            <Text style={styles.sectionSubtitle}>
              Photograph infrastructure defect. AI runs automated triage.
            </Text>

            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraText}>Tap to Capture Evidence</Text>
              <Text style={styles.cameraSubtext}>GPS location tagged automatically</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Incident Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Deep Pothole on Express Lane"
                placeholderTextColor="#64748B"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {['road_damage', 'garbage', 'streetlight', 'drainage_waterlogging'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description & Hazard Details</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe size, traffic impacts, water depth..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleReportSubmit}>
              <Text style={styles.submitButtonText}>Submit to AI Triage</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'map' && (
          <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Smart City Map</Text>
            <Text style={styles.sectionSubtitle}>
              Spatial incident distribution and active hazard clusters.
            </Text>

            <View style={styles.mapMock}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapMockText}>Interactive Leaflet GIS Grid</Text>
              <View style={styles.markerMock}>
                <Text style={styles.markerText}>📍 28.6145, 77.2104</Text>
                <Text style={styles.markerSubtext}>Central District Hotspot • Risk: 88/100</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.tabContainer}>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AR</Text>
              </View>
              <Text style={styles.profileName}>Aiden Reed</Text>
              <Text style={styles.profileEmail}>citizen@urbanpulse.io</Text>
              <Text style={styles.profileRole}>Verified Citizen First Responder</Text>
            </View>

            <View style={styles.pointsCard}>
              <Text style={styles.pointsLabel}>CIVIC REPUTATION</Text>
              <Text style={styles.pointsNumber}>85 Points</Text>
              <Text style={styles.pointsNote}>
                Badges Earned: "Pothole Hunter", "First Responder"
              </Text>
            </View>

            <View style={styles.emergencyCard}>
              <Text style={styles.emergencyTitle}>Municipal Emergency Hotline</Text>
              <Text style={styles.emergencyPhone}>1800-URBAN-911</Text>
              <Text style={styles.emergencyText}>Available 24/7 for catastrophic road or main leaks.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { key: 'feed', label: 'Feed', icon: '📋' },
          { key: 'map', label: 'Map', icon: '🗺️' },
          { key: 'report', label: 'Report', icon: '➕' },
          { key: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, activeTab === tab.key && styles.navItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab.key && styles.navLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B132B',
  },
  headerTitleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerHighlight: {
    color: '#00F2FE',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileBadge: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileBadgeText: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 11,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  tabContainer: {
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#1C2541',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketId: {
    color: '#00F2FE',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  criticalPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  highPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardMeta: {
    color: '#94A3B8',
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statusText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    color: '#64748B',
    fontSize: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  cameraPlaceholder: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  cameraText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cameraSubtext: {
    color: '#64748B',
    fontSize: 11,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryButtonActive: {
    borderColor: '#00F2FE',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
  },
  categoryButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: '#00F2FE',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#00F2FE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#0B132B',
    fontWeight: '800',
    fontSize: 14,
  },
  mapMock: {
    height: 250,
    backgroundColor: '#1C2541',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  mapIcon: {
    fontSize: 40,
  },
  mapMockText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 14,
  },
  markerMock: {
    backgroundColor: '#0B132B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  markerText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 11,
  },
  markerSubtext: {
    color: '#94A3B8',
    fontSize: 10,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    color: '#94A3B8',
    fontSize: 12,
  },
  profileRole: {
    color: '#00F2FE',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  pointsCard: {
    backgroundColor: '#1C2541',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pointsLabel: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 2,
  },
  pointsNote: {
    color: '#94A3B8',
    fontSize: 11,
  },
  emergencyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 4,
  },
  emergencyTitle: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 12,
  },
  emergencyPhone: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  emergencyText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#0B132B',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    padding: 6,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#00F2FE',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#00F2FE',
    fontWeight: '700',
  },
});
