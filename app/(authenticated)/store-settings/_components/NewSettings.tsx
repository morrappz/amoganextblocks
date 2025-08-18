"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVIDER_MODELS } from "@/utils/aiModels";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { getAISettingsData, saveAIFieldsSettings } from "../actions";
import { toast } from "sonner";

const aiSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  tokens_used: z.string().min(0, "Tokens used must be a positive number"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["active", "inactive"]),
  created_date: z.string(),
});

const NewSettings = ({ id }: { id?: string }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof aiSchema>>({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      provider: "",
      model: "",
      tokens_used: "",
      start_date: "",
      end_date: "",
      status: "active",
      created_date: "",
    },
  });

  const providers = Object.keys(PROVIDER_MODELS);
  const provider = form.watch("provider");
  const modelOptions = Object.entries(PROVIDER_MODELS[provider]?.models || {});

  const reset = () => {
    form.reset();
  };

  React.useEffect(() => {
    try {
      const fetchAISettings = async () => {
        const response = await getAISettingsData();
        if (response?.data) {
          const aiData = response.data.api_connection_json;

          form.reset({
            provider: aiData.provider,
            model: aiData.model,
            tokens_used: aiData.tokens_used,
            start_date: aiData.start_date,
            end_date: aiData.end_date,
            status: aiData.status,
            created_date: aiData.created_date,
          });
        }
      };
      fetchAISettings();
    } catch (error) {
      console.error("Error fetching AI settings:", error);
    }
  }, [form]);

  const handleFormSubmit = async (data: z.infer<typeof aiSchema>) => {
    try {
      setIsLoading(true);
      const response = await saveAIFieldsSettings(data);

      if (!response.success) {
        toast.error("Error saving AI settings");
      } else {
        toast.success("AI Settings Saved Successfully");
      }
    } catch (error) {
      toast.error(`${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">New Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure your new settings here.
              </p>
            </div>
            <div>
              <Link href="/store-settings">
                <Button variant="outline">Go Back</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p, index) => (
                        <SelectItem key={index} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map(([model, info]) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokens_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tokens Used</FormLabel>
                  <Input type="number" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent defaultValue={field.value}>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button variant={"outline"} onClick={reset}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleFormSubmit)}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewSettings;
