import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/MaterialIcons";

// ... (rest of your TaskList component code remains the same, but add this query modifier to fetchTasks):

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  initialTitle?: string;
  initialDescription?: string;
}

// Task Modal Component
const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onClose,
  onSave,
  initialTitle = "",
  initialDescription = "",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    onSave(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {initialTitle ? "Edit Task" : "New Task"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TasksScreen: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
  
    const fetchTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log("Current user:", user);
        
        if (!user) {
          console.log("No user found");
          return;
        }
  
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
  
        console.log("Fetched tasks:", data);
        console.log("Error if any:", error);
  
        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error("Detailed error:", error);
        Alert.alert("Error", "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchTasks();
    }, []);
  
    const onRefresh = async () => {
      setLoading(true);
      await fetchTasks();
    };
  
      
  // Update createTask to include user_id
  const createTask = async (title: string, description: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            description,
            status: "pending",
            user_id: user?.id, // Add this line
          },
        ])
        .select();

      if (error) throw error;
      if (data) {
        setTasks([data[0], ...tasks]);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create task");
      console.error(error);
    }
  };

  // Update task
  const updateTask = async (title: string, description: string) => {
    if (!editingTask) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ title, description })
        .eq("id", editingTask.id)
        .select();

      if (error) throw error;
      if (data) {
        setTasks(
          tasks.map((task) => (task.id === editingTask.id ? data[0] : task))
        );
      }
      setEditingTask(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
      console.error(error);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete task");
      console.error(error);
    }
  };

  // Render task item
  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity
          onPress={() => {
            setEditingTask(item);
          }}
          style={styles.iconButton}
        >
          <Icon name="edit" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Task",
              "Are you sure you want to delete this task?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  onPress: () => deleteTask(item.id),
                  style: "destructive",
                },
              ]
            );
          }}
          style={styles.iconButton}
        >
          <Icon name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No tasks found</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={createTask}
      />

      <TaskModal
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
        initialTitle={editingTask?.title}
        initialDescription={editingTask?.description}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
  },
  taskActions: {
    flexDirection: "row",
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#4a90e2",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#4a90e2",
  },
  buttonText: {
    color: "#4a90e2",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
});

export default TasksScreen;
